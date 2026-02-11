
export const rooms = {
    home: (userId: number) => `home.${userId}`,
    chats: {
        on: (chatId: any) => `chats.${chatId}`,
        new: {
            withUser: (userId: any) => `chats.new.with-user.${userId}`,
        },
    },
}
