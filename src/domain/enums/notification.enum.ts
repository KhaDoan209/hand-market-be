export enum NotificationType {
   ORDER_PLACED = "ORDER_PLACED",
   ORDER_SHIPPED = "ORDER_SHIPPED",
   ORDER_DELIVERED = "ORDER_DELIVERED",
   ORDER_CANCELLED = "ORDER_CANCELLED",

   PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
   PAYMENT_FAILED = "PAYMENT_FAILED",

   PROMOTIONAL_OFFER = "PROMOTIONAL_OFFER",
   NEW_PRODUCT_AVAILABLE = "NEW_PRODUCT_AVAILABLE",

   ACCOUNT_ACTIVATED = "ACCOUNT_ACTIVATED",
   PASSWORD_RESET = "PASSWORD_RESET",

   SHIPMENT_BOOKED = "SHIPMENT_BOOKED",
   SHIPMENT_DELAYED = "SHIPMENT_DELAYED",
   SHIPMENT_OUT_FOR_DELIVERY = "SHIPMENT_OUT_FOR_DELIVERY",
   SHIPMENT_DELIVERY_FAILED = "SHIPMENT_DELIVERY_FAILED",
   SHIPMENT_DELIVERED = "SHIPMENT_DELIVERED",

}

export enum NotificationContent {
   ORDER_PLACED = "Đơn hàng của bạn đã được đặt thành công. Chúng tôi đang tiếp tục xử lý đơn hàng của bạn.",
   ORDER_SHIPPED = "Đơn hàng của bạn đã được gửi đi. Hãy chuẩn bị sẵn sàng để nhận hàng.",
   ORDER_DELIVERED = "Chúc mừng! Đơn hàng của bạn đã được giao thành công tới địa chỉ nhận hàng.",
   ORDER_CANCELLED = "Rất tiếc, đơn hàng của bạn đã bị hủy. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.",
   PAYMENT_SUCCESS = "Thanh toán đơn hàng của bạn đã thành công.",
   PAYMENT_FAILED = "Rất tiếc, thanh toán đơn hàng của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
   PROMOTIONAL_OFFER = "Chúng tôi có một chương trình ưu đãi đặc biệt cho bạn. Đừng bỏ lỡ!",
   NEW_PRODUCT_AVAILABLE = "Chúng tôi vừa cập nhật sản phẩm mới. Hãy khám phá ngay!",
   ACCOUNT_ACTIVATED = "Chúc mừng! Tài khoản của bạn đã được kích hoạt thành công.",
   PASSWORD_RESET = "Chúng tôi đã nhận yêu cầu đặt lại mật khẩu của bạn. Vui lòng làm theo hướng dẫn trong email để đặt lại mật khẩu mới.",
   SHIPMENT_BOOKED = "Chúng tôi đã nhận yêu cầu của bạn. Đơn hàng của bạn đã được đặt lịch vận chuyển thành công.",
   SHIPMENT_DELAYED = "Đơn hàng của bạn có chậm trễ trong quá trình vận chuyển. Xin lỗi vì sự bất tiện này. Chúng tôi đang nỗ lực để cải thiện tình hình.",
   SHIPMENT_OUT_FOR_DELIVERY = "Đơn hàng của bạn đang trên đường giao hàng. Hãy chuẩn bị sẵn sàng để nhận hàng.",
   SHIPMENT_DELIVERY_FAILED = "Rất tiếc, chúng tôi đã không thể giao hàng thành công tới địa chỉ nhận hàng. Vui lòng kiểm tra lại địa chỉ và liên hệ với chúng tôi để sắp xếp lại lịch giao hàng.",
   SHIPMENT_DELIVERED = "Chúc mừng! Đơn hàng của bạn đã được giao thành công tới địa chỉ nhận hàng.",
};