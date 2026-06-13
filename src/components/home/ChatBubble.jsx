import { MessageCircle } from 'lucide-react';
import styles from './ChatBubble.module.css';

export default function ChatBubble() {
  const handleClick = () => {
    // If there's an existing chat mechanism, trigger it here.
    // For now, it's just a visual UI component as requested.
    console.log("Chat bubble clicked");
  };

  return (
    <div className={styles.bubble} onClick={handleClick} title="Hỗ trợ trực tuyến">
      <MessageCircle size={28} />
    </div>
  );
}
