export const SOCKET_EVENTS = {
    // Usuario
    USER_JOIN: 'user:join',
    USER_LEAVE: 'user:leave',
    USERS_LIST: 'users:list',

    // Mensajes
    MESSAGE_SEND: 'message:send',
    MESSAGE_RECEIVED: 'message:received',
    MESSAGES_LOAD: 'messages:load',
    MESSAGES_LOADED: 'messages:loaded',
    MESSAGES_MARK_READ: 'messages:mark_read',

    // Notificaciones
    NOTIFICATION_NEW_MESSAGE: 'notification:new_message',

    // Sistema
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ERROR: 'error'
};

export const MESSAGE_CONSTRAINTS = {
    MAX_LENGTH: 1000,
    MIN_LENGTH: 1
};

export const USER_CONSTRAINTS = {
    NICKNAME_MIN_LENGTH: 3,
    NICKNAME_MAX_LENGTH: 20,
    NICKNAME_PATTERN: /^[a-zA-Z0-9_]+$/
};