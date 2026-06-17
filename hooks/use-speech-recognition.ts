"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createRecognition,
  isSpeechRecognitionSupported,
  type SpeechRecognitionInstance,
} from "@/lib/speech-recognition";

export interface SpeechResult {
  // Phương án nhận dạng tốt nhất (transcript chính).
  transcript: string;
  // Tất cả phương án thay thế — dùng để chấm khớp linh hoạt hơn.
  alternatives: string[];
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  // Gọi khi có kết quả cuối cùng (isFinal).
  onResult?: (result: SpeechResult) => void;
}

export interface UseSpeechRecognitionReturn {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

// Map mã lỗi của Web Speech API sang thông báo Tiếng Việt thân thiện.
function describeError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Bạn cần cho phép quyền truy cập micro để dùng tính năng này.";
    case "no-speech":
      return "Không nghe thấy giọng nói. Hãy thử nói rõ và gần micro hơn.";
    case "audio-capture":
      return "Không tìm thấy micro. Kiểm tra lại thiết bị thu âm.";
    case "network":
      return "Lỗi mạng khi nhận dạng giọng nói. Kiểm tra kết nối internet.";
    case "aborted":
      return "";
    default:
      return "Đã xảy ra lỗi khi nhận dạng giọng nói. Vui lòng thử lại.";
  }
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const { lang = "en-US", onResult } = options;

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Giữ callback mới nhất trong ref để không phải tạo lại recognition.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  // Dọn dẹp khi unmount.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    // Đang nghe dở thì huỷ trước khi bắt đầu phiên mới.
    recognitionRef.current?.abort();

    const recognition = createRecognition(lang);
    if (!recognition) {
      setError("Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge.");
      return;
    }

    setError(null);
    setInterim("");

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      if (!result) return;

      if (result.isFinal) {
        const alternatives: string[] = [];
        for (let i = 0; i < result.length; i++) {
          alternatives.push(result[i].transcript);
        }
        const transcript = alternatives[0] ?? "";
        setInterim(transcript);
        onResultRef.current?.({ transcript, alternatives });
      } else {
        setInterim(result[0]?.transcript ?? "");
      }
    };

    recognition.onerror = (event) => {
      const message = describeError(event.error);
      if (message) setError(message);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      // start() ném lỗi nếu gọi khi đang chạy — bỏ qua an toàn.
    }
  }, [lang]);

  return { supported, listening, interim, error, start, stop };
}
