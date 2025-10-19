import { useState, useEffect } from 'react';

export interface SavedMessage {
	id: string;
	title: string;
	content: string;
	type: 'connection' | 'message' | 'inmail';
	createdAt: Date;
	updatedAt: Date;
}

const STORAGE_KEY = 'jobrani-message-library';

export const useMessageLibrary = () => {
	const [messages, setMessages] = useState<SavedMessage[]>([]);

	// Load messages from localStorage on mount
	useEffect(() => {
		const storedMessages = localStorage.getItem(STORAGE_KEY);
		if (storedMessages) {
			try {
				const parsed = JSON.parse(storedMessages);
				const messagesWithDates = parsed.map((msg: any) => ({
					...msg,
					createdAt: new Date(msg.createdAt),
					updatedAt: new Date(msg.updatedAt)
				}));
				setMessages(messagesWithDates);
			} catch (error) {
				console.error('Error loading messages from localStorage:', error);
			}
		}
	}, []);

	// Save messages to localStorage whenever messages change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
	}, [messages]);

	const saveMessage = (
		title: string,
		content: string,
		type: SavedMessage['type']
	): SavedMessage => {
		const newMessage: SavedMessage = {
			id: Date.now().toString(),
			title,
			content,
			type,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		setMessages((prev) => [newMessage, ...prev]);
		return newMessage;
	};

	const updateMessage = (
		id: string,
		updates: Partial<Pick<SavedMessage, 'title' | 'content' | 'type'>>
	) => {
		setMessages((prev) =>
			prev.map((msg) => (msg.id === id ? { ...msg, ...updates, updatedAt: new Date() } : msg))
		);
	};

	const deleteMessage = (id: string) => {
		setMessages((prev) => prev.filter((msg) => msg.id !== id));
	};

	const getMessageById = (id: string) => {
		return messages.find((msg) => msg.id === id);
	};

	const getMessagesByType = (type: SavedMessage['type']) => {
		return messages.filter((msg) => msg.type === type);
	};

	return {
		messages,
		saveMessage,
		updateMessage,
		deleteMessage,
		getMessageById,
		getMessagesByType
	};
};
