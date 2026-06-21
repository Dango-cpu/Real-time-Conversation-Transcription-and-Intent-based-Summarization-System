const translations = ['Chào buổi sáng! Chúng ta cùng xem lại kế hoạch ra mắt ứng dụng di động nhé?','Chắc chắn rồi. Thiết kế đã sẵn sàng và đội phát triển có thể bắt đầu vào thứ Hai.','Tuyệt vời. Hãy ưu tiên quy trình làm quen và hướng tới bản beta vào tháng tới.']
export async function translateTranscript(messages, targetLanguage) {
  return { provider:'mock', isMock:true, transcript:messages.map((item,index) => ({...item, speaker:`${item.speaker} · ${targetLanguage}`, text:targetLanguage === 'English' ? item.text : translations[index] || `[${targetLanguage}] ${item.text}`})) }
}
