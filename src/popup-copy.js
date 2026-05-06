export const popupCopy = {
  en: {
    title: "Wiren Board Local Controllers",
    popupTitle: "WB Controller Tracker",
    onlineOnly: "Online only",
    noDevices: "No controllers added yet. Open a controller web UI once and it will appear here.",
    delete: "Delete",
    moreActions: "More actions"
  },
  ru: {
    title: "Локальные контроллеры Wiren Board",
    popupTitle: "WB Controller Tracker",
    onlineOnly: "Только онлайн",
    noDevices: "Контроллеры ещё не добавлены. Откройте web UI контроллера один раз, и он появится здесь.",
    delete: "Удалить",
    moreActions: "Ещё"
  }
};

export function getPopupCopy(locale) {
  return locale?.startsWith("ru") ? popupCopy.ru : popupCopy.en;
}
