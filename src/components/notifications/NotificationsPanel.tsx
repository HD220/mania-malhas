"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BellRing, X } from "lucide-react"; // Exemplo de ícones

// Tipo para uma notificação de exemplo
interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: Date;
}

// Dados mockados para notificações
const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Novo Produto Adicionado!",
    description: "O produto 'Camiseta Estilosa' foi adicionado ao catálogo.",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
  },
  {
    id: "2",
    title: "Pagamento Recebido",
    description: "Pagamento de R$ 150,00 recebido para a transação TXN-001.",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
  },
  {
    id: "3",
    title: "Alerta de Estoque Baixo",
    description: "O produto 'Calça Jeans Slim' está com apenas 5 unidades em estoque.",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
  },
];

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * `NotificationsPanel` is a client component that displays a list of notifications
 * within a Sheet (side panel). It currently uses mock data and includes placeholders
 * for future functionality like marking notifications as read and clearing all.
 *
 * @param {NotificationsPanelProps} props - Props for the component.
 * @param {boolean} props.open - Controls the visibility of the notification panel.
 * @param {(open: boolean) => void} props.onOpenChange - Callback function to handle panel open/close state changes.
 */
export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  // TODO: No futuro, buscar notificações reais de um estado global, context, ou API.
  const notifications = mockNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    // TODO: Implementar lógica para marcar notificação como lida (estado local ou API)
    console.log(`Marcar notificação ${notificationId} como lida.`);
    // Para simulação, poderia atualizar o estado local aqui se notifications fosse um estado.
  };

  const handleClearAll = () => {
    // TODO: Implementar lógica para limpar todas as notificações
    console.log("Limpar todas as notificações.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Aqui estão suas atualizações mais recentes.
          </SheetDescription>
        </SheetHeader>

        {notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Nenhuma notificação nova.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 -mr-4"> {/* Ajuste de padding para scrollbar */}
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-3 rounded-md border ${notification.read ? 'bg-muted/50 opacity-70' : 'bg-card'}`}
                >
                  <h4 className="font-semibold text-sm mb-0.5">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{notification.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="link"
                        size="xs"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SheetFooter className="mt-auto pt-4 border-t">
          {notifications.length > 0 && (
             <Button variant="outline" size="sm" onClick={handleClearAll} className="mr-auto">
                Limpar Todas
              </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline" size="sm">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
