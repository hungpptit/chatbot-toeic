import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   port: 3000, // hoặc bất kỳ cổng nào bạn muốn còn ko thì vite chọn mặc định là 5173, nếu 5173 bị hciếm thì nó sẽ nhảy qua cổng khác
  // }
})
