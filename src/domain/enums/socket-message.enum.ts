export enum SocketMessage {
   JoinRoom = 'join_room',
   NewNotification = 'new_notification',
   NewOrder = 'new_order',
   ReadNoti = 'read_noti',
   NewFreepick = 'new_freepick',
   UpdateFreepick = 'update_freepick',
   UpdateOrderInProgress = 'update_order_in_progress',
   OrderStatusUpdate = 'order_status_update',
   UpdateWaitingDone = 'update_waiting_done',
   NewMessage = 'new_message',
   NewConversation = 'new_conversation',
   SeenMessage = 'seen_message'
}