
/**
 * Để demo và tập trung vào đúng nội dung chính nên phần Cors này mình không config gì nhiều.
 */
export const corsOptions = {
  origin: function (origin, callback) {
    return callback(null, true)
  },

  // ✅ Đảm bảo phản hồi không bị lỗi trên trình duyệt cũ
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request
  credentials: true
}
