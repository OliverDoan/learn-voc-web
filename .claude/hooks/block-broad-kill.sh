#!/usr/bin/env bash
# PreToolUse/Bash: chặn lệnh giết tiến trình theo TÊN (pkill/killall) nhắm vào
# dev server. Lệnh kiểu `pkill -f "next dev"` khớp MỌI tiến trình cùng tên,
# kể cả dev server do người dùng tự chạy từ trước -> làm hỏng phiên làm việc
# của họ. Chỉ được tắt tiến trình do chính mình khởi động, theo PID.
set -u

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -n "$cmd" ] || exit 0

# Có gọi pkill/killall như một lệnh (đầu dòng, sau ; && || | hoặc khoảng trắng)?
printf '%s' "$cmd" | grep -qE '(^|[;&|(]|[[:space:]])(pkill|killall)([[:space:]]|$)' || exit 0

# Chỉ chặn khi nhắm vào tiến trình dev server / runtime JS.
printf '%s' "$cmd" | grep -qiE '(next|node|npm|pnpm|yarn|vite|bun|tsx|webpack)' || exit 0

reason='Chặn lệnh giết tiến trình theo TÊN (pkill/killall) nhắm vào dev server: nó khớp MỌI tiến trình cùng tên, kể cả dev server người dùng đang chạy từ trước. Thay vào đó hãy tắt đúng tiến trình do chính bạn khởi động: lưu PID lúc chạy nền rồi kill PID đó, hoặc dùng Bash(run_in_background) kèm TaskStop. Nếu chỉ cần kiểm tra app, hãy tái dùng server đang chạy thay vì khởi động lại.'

jq -n --arg r "$reason" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $r
  }
}'
exit 0
