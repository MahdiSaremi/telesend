
export const events = {
    receiveUpdate: `receive-update`,
    chats: {
        receiveUpdate: (chatId: any) => `chats.${chatId}.receive-update`,
        new: {
            withUser: (userId: any) => `chats.new.with-user.${userId}`,
        },
    },
}
