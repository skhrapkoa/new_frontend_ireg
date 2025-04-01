export function getFileType(filename: string): string {
  if (!filename) return 'other';
  const extension = filename.split('.').pop()?.toLowerCase(); // Получаем расширение файла и приводим к нижнему регистру
  if (!extension) {
    return 'other'; // Если расширение не найдено, возвращаем 'other'
  }
  console.log('getFileType')
  console.log(extension)

  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'txt':
      return 'document';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'audio';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'excel';
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive';
    default:
      return 'other';
  }
}
