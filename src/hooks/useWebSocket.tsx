import { useEffect, useCallback, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { INotification, NotificationEvent } from '@/types/notification.interface';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { useAppDispatch } from '@/lib/hooks';
import { updateNotifications } from '@/lib/features/notifications/notificationsSlice';
import { toast } from '@/hooks/use-toast';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

interface WebSocketHook {
  isConnected: boolean;
  emit: (eventName: NotificationEvent, data: unknown) => void;
  on: (eventName: NotificationEvent, callback: (...args: unknown[]) => void) => void;
}

const useWebSocket = (): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const dispatch = useAppDispatch();

  const connect = useCallback(() => {
    try {
      const websocket = io(WS_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        retries: 5,
        transports: ['websocket'],
      });

      websocket.on('connect', (): void => {
        setIsConnected(true);
        console.log('WebSocket Connected');
      });

      websocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('WebSocket Disconnected');
      });

      websocket.on(NotificationEvent.NewNotification, (data: INotification) => {
        const audio = new Audio('/audio/zomujo-notification-sound.wav');
        audio.load();
        dispatch(updateNotifications(data));
        void audio.play();
        const { message, topic } = data.payload;
        toast({
          title: topic,
          description: message,
          variant: 'default',
        });
      });

      // TODO: Let's connect websocket to get instant notification of a new request
      // websocket.on(NotificationEvent.NewRequest, (data: INotification) => {
      //   console.log('Hey there new request', data);
      // });

      websocket.on('error', (error) => {
        console.error('WebSocket Error:', error);
      });

      socketRef.current = websocket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, []);

  const emit = useCallback((eventName: NotificationEvent, data: unknown) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  const on = useCallback((eventName: NotificationEvent, callback: (...args: unknown[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  }, []);

  useEffect(() => {
    connect();

    return (): void => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected, emit, on };
};

export default useWebSocket;
