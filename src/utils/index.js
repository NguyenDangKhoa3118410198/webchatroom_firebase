import {
   FilePdfOutlined,
   FileWordOutlined,
   FileExcelOutlined,
   FilePptOutlined,
   FileImageOutlined,
   FileOutlined,
   FileZipOutlined,
} from '@ant-design/icons';

export const formatTime = (seconds) => {
   if (!seconds) return '';
   const date = new Date(seconds * 1000);
   const hours = date.getUTCHours().toString().padStart(2, '0');
   const minutes = date.getUTCMinutes().toString().padStart(2, '0');
   return `${hours}:${minutes}`;
};

export const getIconFile = (fileType) => {
   const fileTypeExtension = fileType.split('/')[1] || 'unknown';
   switch (fileTypeExtension) {
      case 'pdf':
         return (
            <FilePdfOutlined style={{ fontSize: '24px', color: '#d32f2f' }} />
         );
      case 'msword':
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
         return (
            <FileWordOutlined style={{ fontSize: '24px', color: '#1e88e5' }} />
         );
      case 'vnd.ms-excel':
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'csv':
         return (
            <FileExcelOutlined style={{ fontSize: '24px', color: '#43a047' }} />
         );
      case 'vnd.openxmlformats-officedocument.presentationml.presentation':
         return (
            <FilePptOutlined style={{ fontSize: '24px', color: '#e64a19' }} />
         );
      case 'png':
      case 'jpeg':
      case 'jpg':
      case 'gif':
         return (
            <FileImageOutlined style={{ fontSize: '24px', color: '#2196f3' }} />
         );
      case 'mp3':
      case 'wav':
         return <FileOutlined style={{ fontSize: '24px', color: '#f57c00' }} />;
      case 'mp4':
      case 'webm':
      case 'ogg':
         return <FileOutlined style={{ fontSize: '24px', color: '#0288d1' }} />;
      case 'zip':
      case 'rar':
         return (
            <FileZipOutlined style={{ fontSize: '24px', color: '#7b1fa2' }} />
         );
      case 'txt':
         return <FileOutlined style={{ fontSize: '24px', color: '#616161' }} />;
      default:
         return <FileOutlined style={{ fontSize: '24px', color: '#616161' }} />;
   }
};
