import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_REMINDER,
  loadReminderSettings,
  parseReminderTime,
  saveReminderSettings,
  shouldRemindNow,
} from "../reminder";

const at = (h: number, m = 0) => new Date(2026, 2, 10, h, m, 0);

describe("parseReminderTime", () => {
  it("tách đúng giờ và phút", () => {
    expect(parseReminderTime("20:30")).toEqual({ hours: 20, minutes: 30 });
    expect(parseReminderTime("07:05")).toEqual({ hours: 7, minutes: 5 });
    expect(parseReminderTime("00:00")).toEqual({ hours: 0, minutes: 0 });
  });

  it("trả null với giá trị sai định dạng hoặc ngoài khoảng", () => {
    expect(parseReminderTime("")).toBeNull();
    expect(parseReminderTime("24:00")).toBeNull();
    expect(parseReminderTime("12:60")).toBeNull();
    expect(parseReminderTime("abc")).toBeNull();
    expect(parseReminderTime("8h30")).toBeNull();
  });
});

describe("shouldRemindNow", () => {
  const enabled = { enabled: true, time: "20:00" };

  it("chưa bật thì không nhắc", () => {
    expect(
      shouldRemindNow({
        settings: { enabled: false, time: "20:00" },
        now: at(21),
        lastNotifiedAt: null,
        studiedToday: false,
      }),
    ).toBe(false);
  });

  it("chưa tới giờ thì không nhắc", () => {
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(19, 59),
        lastNotifiedAt: null,
        studiedToday: false,
      }),
    ).toBe(false);
  });

  it("đúng giờ và chưa học → nhắc", () => {
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(20),
        lastNotifiedAt: null,
        studiedToday: false,
      }),
    ).toBe(true);
  });

  it("qua giờ nhắc vẫn nhắc (mở app muộn)", () => {
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(22, 30),
        lastNotifiedAt: null,
        studiedToday: false,
      }),
    ).toBe(true);
  });

  it("đã học hôm nay thì không nhắc", () => {
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(21),
        lastNotifiedAt: null,
        studiedToday: true,
      }),
    ).toBe(false);
  });

  it("đã nhắc hôm nay rồi thì không nhắc lại", () => {
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(22),
        lastNotifiedAt: at(20, 1).getTime(),
        studiedToday: false,
      }),
    ).toBe(false);
  });

  it("lần nhắc gần nhất là hôm qua → vẫn nhắc hôm nay", () => {
    const yesterdayEvening = new Date(2026, 2, 9, 20, 5, 0).getTime();
    expect(
      shouldRemindNow({
        settings: enabled,
        now: at(20, 5),
        lastNotifiedAt: yesterdayEvening,
        studiedToday: false,
      }),
    ).toBe(true);
  });

  it("giờ nhắc sai định dạng → không nhắc", () => {
    expect(
      shouldRemindNow({
        settings: { enabled: true, time: "99:99" },
        now: at(23),
        lastNotifiedAt: null,
        studiedToday: false,
      }),
    ).toBe(false);
  });
});

describe("load/saveReminderSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("chưa lưu gì → trả mặc định", () => {
    expect(loadReminderSettings()).toEqual(DEFAULT_REMINDER);
  });

  it("lưu rồi đọc lại giữ nguyên giá trị", () => {
    saveReminderSettings({ enabled: true, time: "07:30" });
    expect(loadReminderSettings()).toEqual({ enabled: true, time: "07:30" });
  });

  it("dữ liệu hỏng trong localStorage → trả mặc định, không ném lỗi", () => {
    localStorage.setItem("voca-reminder", "{không phải json");
    expect(loadReminderSettings()).toEqual(DEFAULT_REMINDER);
  });

  it("giờ không hợp lệ trong localStorage → trả mặc định", () => {
    localStorage.setItem(
      "voca-reminder",
      JSON.stringify({ enabled: true, time: "25:00" }),
    );
    expect(loadReminderSettings()).toEqual(DEFAULT_REMINDER);
  });
});
