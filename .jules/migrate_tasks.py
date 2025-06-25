import os
import re
import yaml
from datetime import datetime

# Configuration
TASKS_MD_PATH = ".jules/TASKS.md"
OUTPUT_DIR = ".jules/tasks"
DEFAULT_TITLE_MAX_LENGTH = 70 # Max length for a title if we try to derive it

# Helper to safely convert to int
def safe_int(value, default=None):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

# Helper to parse dependencies
def parse_dependencies(dep_str):
    if not dep_str or dep_str == '-':
        return []
    return [d.strip() for d in dep_str.split(',') if d.strip()]

# Helper to create a concise title (optional, can be improved)
def create_concise_title(description):
    if not description:
        return "Untitled Task"
    # Simple approach: first line or first N chars
    first_line = description.split('\n')[0]
    if len(first_line) <= DEFAULT_TITLE_MAX_LENGTH:
        return first_line.strip()
    # If first line is too long, try to find a shorter segment
    shorter = description[:DEFAULT_TITLE_MAX_LENGTH]
    if ' ' in shorter:
        return shorter.rsplit(' ', 1)[0] + "..."
    return shorter + "..."


def parse_date_field(date_str):
    if not date_str or date_str.strip() == '-':
        return None
    try:
        # Assuming YYYY-MM-DD format
        datetime.strptime(date_str.strip(), '%Y-%m-%d')
        return date_str.strip()
    except ValueError:
        # Potentially handle other formats or return as is for manual review
        # For now, if it's not YYYY-MM-DD, we might skip it or log a warning
        print(f"Warning: Could not parse date '{date_str}'. Skipping.")
        return None

def main():
    if not os.path.exists(TASKS_MD_PATH):
        print(f"Error: {TASKS_MD_PATH} not found.")
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    with open(TASKS_MD_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find table rows (simplistic, assumes fairly clean Markdown table)
    # This regex looks for lines starting with '|' and containing at least one more '|'
    # It skips header separator lines like |---|---|
    table_rows_matches = re.findall(r"^\s*\|([^\|\n]+(?:\|[^\|\n]+)+)\|\s*$", content, re.MULTILINE)

    if not table_rows_matches:
        print("No task rows found in the Markdown table.")
        return

    header_skipped = False
    tasks_migrated_count = 0

    for row_content in table_rows_matches:
        cells = [cell.strip() for cell in row_content.split('|')]

        # Skip header row and separator row based on content
        if "ID da Tarefa" in cells[0] or re.match(r"^-+(:?-+:?)+$", cells[0]): # Handle |:---| or |---| and variations
            if "ID da Tarefa" in cells[0]:
                 header_skipped = True
            continue

        if not header_skipped: # Ensure we process only after the header
            continue

        # Ensure the row has the expected number of columns (10 in the original table)
        # Allow for an optional empty cell at the beginning or end if split produces extra
        if not (10 <= len(cells) <= 12): #常见情况是首尾多出空cell
            actual_content_cells = [c for c in cells if c]
            if len(actual_content_cells) == 10:
                cells = actual_content_cells
            else:
                print(f"Warning: Skipping row with unexpected number of cells ({len(cells)}, content cells: {len(actual_content_cells)}): {row_content}")
                continue

        # Re-evaluate cells if the split included empty first/last cells due to leading/trailing |
        if cells[0] == '' and len(cells) > 10: # Likely leading empty cell
            cells = cells[1:]
        if cells[-1] == '' and len(cells) > 10: # Likely trailing empty cell
            cells = cells[:-1]

        if len(cells) != 10:
            print(f"Warning: Still skipping row after cleanup due to unexpected number of cells ({len(cells)}): {row_content}")
            continue


        task_id = cells[0]
        priority = cells[1]
        description = cells[2]
        status = cells[3]
        complexity_str = cells[4] # Will be like "1", "2", etc. or "2 (Baixa)"
        assigned_to = cells[5] if cells[5] and cells[5] != '-' else None
        dependencies_str = cells[6]
        creation_date_str = cells[7]
        completion_est_real_date_str = cells[8]
        notes = cells[9] if cells[9] and cells[9] != '-' else None

        if not task_id or task_id == '-': # Skip empty or placeholder rows
            #print(f"Skipping row with missing Task ID: {cells}")
            continue

        # Extract just the number for complexity
        complexity_match = re.match(r"(\d+)", complexity_str)
        complexity = safe_int(complexity_match.group(1) if complexity_match else complexity_str, 1)


        # Create frontmatter
        frontmatter = {
            "id": task_id,
            "title": create_concise_title(description), # Use helper for title
            "priority": priority,
            "status": status,
            "complexity": complexity,
            "creation_date": parse_date_field(creation_date_str),
        }
        if assigned_to:
            frontmatter["assigned_to"] = assigned_to

        parsed_deps = parse_dependencies(dependencies_str)
        if parsed_deps:
            frontmatter["dependencies"] = parsed_deps

        # Handle due_date and completion_date
        parsed_comp_est_real_date = parse_date_field(completion_est_real_date_str)
        if parsed_comp_est_real_date:
            if status.lower() == "concluído": # Portuguese "Concluído"
                frontmatter["completion_date"] = parsed_comp_est_real_date
            elif status.lower() == "subdividido": # If it's subdivided, it's not exactly 'due'
                 pass # Or maybe set a specific tag/note
            else:
                frontmatter["due_date"] = parsed_comp_est_real_date

        if notes:
            frontmatter["notes"] = notes.strip() # Ensure notes are clean

        # Construct file content
        # PyYAML Dumper configuration for better multi-line string representation
        def str_presenter(dumper, data):
            if len(data.splitlines()) > 1:  # check for multi-line string
                return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
            return dumper.represent_scalar('tag:yaml.org,2002:str', data)

        yaml.add_representer(str, str_presenter)

        # Sort keys = False is good, but let's define an explicit order for consistency
        key_order = ['id', 'title', 'priority', 'status', 'complexity', 'assigned_to',
                     'dependencies', 'parent_task', 'creation_date', 'due_date',
                     'completion_date', 'tags', 'notes']

        ordered_frontmatter = {k: frontmatter[k] for k in key_order if k in frontmatter}
        # Add any keys that might have been missed by key_order (though shouldn't happen with current logic)
        for k_fm, v_fm in frontmatter.items():
            if k_fm not in ordered_frontmatter:
                ordered_frontmatter[k_fm] = v_fm


        yaml_frontmatter = yaml.dump(ordered_frontmatter, sort_keys=False, allow_unicode=True, width=float("inf"))

        file_content = f"---\n{yaml_frontmatter}---\n\n{description.strip()}\n"

        # Sanitize task_id for filename
        filename = "".join(c if c.isalnum() or c in ['.', '-'] else '_' for c in task_id) + ".md"
        filepath = os.path.join(OUTPUT_DIR, filename)

        try:
            with open(filepath, 'w', encoding='utf-8') as f_task:
                f_task.write(file_content)
            #print(f"Migrated: {task_id} -> {filepath}")
            tasks_migrated_count +=1
        except IOError as e:
            print(f"Error writing file for task {task_id}: {e}")


    print(f"Migration process completed. {tasks_migrated_count} tasks processed and files created in {OUTPUT_DIR}.")
    if tasks_migrated_count == 0 and header_skipped:
         print("It seems no data rows were processed after header. Check table format and regex if this is unexpected.")
    elif tasks_migrated_count == 0 and not header_skipped:
         print("Header not found or no data rows. Check TASKS.md content and script logic.")


if __name__ == "__main__":
    main()
