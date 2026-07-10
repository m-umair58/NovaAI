import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemedToaster } from '@/components/common/ThemedToaster'
import { Home, History, HistoryDetail } from '@/pages'

export default function App() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <BrowserRouter>
        <div className="flex min-h-screen w-full flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<HistoryDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
      <ThemedToaster />
    </div>
  )
}
