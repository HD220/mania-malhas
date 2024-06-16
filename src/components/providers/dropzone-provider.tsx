"use cliente";

import {
  useDropzone as useReactDropzone,
  DropzoneOptions,
  DropzoneState,
} from "react-dropzone";
import { ReactNode, createContext, useContext } from "react";

const DropzoneContext = createContext<DropzoneState | null>(null);

export function DropzoneProvider({
  options,
  children,
}: {
  options: DropzoneOptions;
  children: ReactNode;
}) {
  const dropzone = useReactDropzone(options);

  return (
    <DropzoneContext.Provider value={dropzone}>
      {children}
    </DropzoneContext.Provider>
  );
}

export function useDropzone() {
  const context = useContext(DropzoneContext);

  if (!context)
    throw new Error("Somente pode ser usado dentro de um provider dropzone!.");

  return context;
}
