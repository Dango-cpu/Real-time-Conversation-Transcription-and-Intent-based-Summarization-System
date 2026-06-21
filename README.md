# Voxly — Conversation transcription demo

Ứng dụng Node.js + Express + Handlebars để thu âm hội thoại bằng microphone, trình bày transcript/bản dịch và tạo insight dạng demo. Giao diện dùng Tailwind CSS và JavaScript thuần; dữ liệu dùng Supabase khi được cấu hình, nếu không sẽ tự chuyển sang mock in-memory và không bị crash.

## Yêu cầu

- Node.js 20 trở lên
- npm 10 trở lên (khuyến nghị)
- Trình duyệt hỗ trợ `MediaRecorder` và `getUserMedia`

## Cài đặt và chạy

```bash
npm install
copy .env.example .env
npm run dev
```

Mở `http://localhost:3000`. Chạy production bằng:

```bash
npm run build:css
npm start
```

Các script:

- `npm run dev`: build CSS rồi chạy Node watch mode.
- `npm start`: chạy production server.
- `npm run build:css`: tạo CSS Tailwind đã minify.
- `npm run watch:css`: theo dõi và build CSS khi sửa giao diện.

## Biến môi trường

Tạo `.env` từ `.env.example`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

Không dùng service-role key trong ứng dụng này và không đưa `.env` lên Git. Khi thiếu URL hoặc anon key, banner trên giao diện và `/api/status` sẽ báo chế độ mock.

## Thiết lập Supabase

1. Tạo project trên Supabase.
2. Mở SQL Editor và chạy `supabase/migrations/202606210001_create_conversations.sql`, hoặc dùng Supabase CLI (`supabase db push`) nếu project đã được link.
3. Điền Project URL và anon key vào `.env`.
4. Khởi động lại server.

Migration có policy anon rộng để luồng demo CRUD hoạt động. Trước production, phải thêm đăng nhập và thay policy bằng quyền theo từng người dùng.

## API

- `GET /api/status`
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `POST /api/conversations`
- `DELETE /api/conversations/:id`
- `POST /api/processing/transcribe`
- `POST /api/processing/summarize`

Response luôn dùng dạng `{ success, data, meta }`; lỗi dùng `{ success: false, error: { code, message } }`.

## Phần đang mock và cách tích hợp AI thật

Microphone được thu thật bằng `MediaRecorder`, nhưng audio chưa được gửi tới mô hình. Transcript, translation, intent và summary được tạo bởi adapter mock, có ghi rõ trong metadata API và giao diện.

Thay nội dung các adapter sau để tích hợp Whisper, OpenAI hoặc provider khác mà không cần đổi UI/API contract:

- `src/services/speechToTextService.js`
- `src/services/translationService.js`
- `src/services/intentAnalysisService.js`
- `src/services/summarizationService.js`

Với audio thật, nên dùng multipart upload hoặc streaming WebSocket, kiểm tra MIME/kích thước và lưu file ngoài process thay vì nhúng base64 vào JSON.
