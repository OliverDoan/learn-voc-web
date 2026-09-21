/**
 * Cổng phím Enter cho các bài tập "nộp bằng Enter, rồi Enter lần nữa để sang câu".
 *
 * Vấn đề: chính phím Enter dùng để nộp bài vẫn đang được giữ khi màn hình kết
 * quả hiện ra. Bàn phím tự lặp (`event.repeat`) nên câu tiếp theo bị nhảy qua
 * ngay, người học chưa kịp đọc đúng/sai.
 *
 * Cách chặn: cổng khoá sẵn khi tạo, chỉ mở sau khi người học THẢ phím Enter.
 * Mỗi lần nhấn chỉ chuyển được một câu — muốn câu nữa thì phải nhả rồi nhấn lại.
 */

/** Phần thông tin cần dùng của một sự kiện bàn phím (đủ để test không cần DOM). */
export interface EnterKeyEvent {
  key: string;
  repeat?: boolean;
  preventDefault?: () => void;
}

export interface EnterGate {
  /** Trả về `true` nếu phím này thực sự kích hoạt hành động chuyển tiếp. */
  handleKeyDown: (event: EnterKeyEvent) => boolean;
  handleKeyUp: (event: EnterKeyEvent) => void;
}

const isEnter = (event: EnterKeyEvent) => event.key === "Enter";

export function createEnterGate(onTrigger: () => void): EnterGate {
  // Khoá cho tới khi người học nhả phím Enter đã dùng để nộp bài.
  let armed = false;

  return {
    handleKeyDown(event) {
      if (!isEnter(event) || event.repeat || !armed) return false;
      armed = false;
      event.preventDefault?.();
      onTrigger();
      return true;
    },
    handleKeyUp(event) {
      if (!isEnter(event)) return;
      armed = true;
    },
  };
}
