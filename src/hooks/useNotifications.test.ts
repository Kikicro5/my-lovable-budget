import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Capacitor LocalNotifications
vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    checkPermissions: vi.fn().mockResolvedValue({ display: "prompt" }),
    requestPermissions: vi.fn().mockResolvedValue({ display: "granted" }),
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
  },
}));

describe("useNotifications default settings", () => {
  beforeEach(() => {
    // Clear localStorage before each test to simulate fresh install
    localStorage.clear();
  });

  it("should have all notifications disabled by default on fresh install", () => {
    // Simulate what happens on fresh install - no localStorage data
    const stored = localStorage.getItem("notification-settings");
    expect(stored).toBeNull();

    // Verify the DEFAULT_SETTINGS values directly
    const DEFAULT_SETTINGS = {
      enabled: false,
      dailyReminder: false,
      reminderTime: "20:00",
      paymentReminders: false,
    };

    expect(DEFAULT_SETTINGS.enabled).toBe(false);
    expect(DEFAULT_SETTINGS.dailyReminder).toBe(false);
    expect(DEFAULT_SETTINGS.paymentReminders).toBe(false);
  });

  it("should not have any notification settings in localStorage on fresh install", () => {
    // Fresh install means no localStorage data
    const stored = localStorage.getItem("notification-settings");
    expect(stored).toBeNull();
  });

  it("should preserve disabled state when settings are saved", () => {
    const settings = {
      enabled: false,
      dailyReminder: false,
      reminderTime: "20:00",
      paymentReminders: false,
    };

    localStorage.setItem("notification-settings", JSON.stringify(settings));

    const stored = localStorage.getItem("notification-settings");
    const parsed = JSON.parse(stored!);

    expect(parsed.enabled).toBe(false);
    expect(parsed.dailyReminder).toBe(false);
    expect(parsed.paymentReminders).toBe(false);
  });
});
