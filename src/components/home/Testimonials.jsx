import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: 'Minh Tuấn',
      school: 'ĐH Bách Khoa Hà Nội',
      avatar: '👨‍🎓',
      text: '"Lúc mới sang Nhật mình rất sợ mắc lỗi giao tiếp. Nhờ phần Sổ tay văn hóa và Test tình huống của web, mình đã tự tin vượt qua tháng thử việc đầu tiên mà không bị nhắc nhở gì."',
      rating: 5
    },
    {
      id: 2,
      name: 'Hải Yến',
      school: 'ĐH Ngoại Ngữ - ĐHQGHN',
      avatar: '👩‍🎓',
      text: '"Phần tạo CV (Rirekisho) thực sự cứu rỗi cuộc đời mình! Trước đây mình toàn loay hoay căn lề Word, giờ chỉ cần điền form là có ngay bản CV PDF chuẩn xác để nộp cho công ty IT."',
      rating: 5
    },
    {
      id: 3,
      name: 'Quang Vinh',
      school: 'FPT University',
      avatar: '🧑‍💻',
      text: '"Góc Senpai rất hữu ích. Mình đã hỏi một câu về luật làm thêm giờ ở Nhật và được các anh chị đi trước giải đáp cực kỳ tận tình chỉ sau vài giờ. Cảm ơn đội ngũ rất nhiều!"',
      rating: 5
    }
  ];

  return (
    <div className={styles.testimonialsSection}>
      <h2 className={styles.title}>Học viên nói gì về chúng tôi?</h2>
      <div className={styles.grid}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.rating}>
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className={styles.reviewText}>{review.text}</p>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{review.avatar}</div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>{review.name}</span>
                <span className={styles.userSchool}>{review.school}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
