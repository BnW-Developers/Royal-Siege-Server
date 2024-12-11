import gameSessionManager from '../classes/managers/gameSessionManager.js';
import userSessionManager from '../classes/managers/userSessionManager.js';
import { handleErr } from '../utils/error/handlerErr.js';

export const onEnd = (socket) => () => {
  try {
    const user = userSessionManager.getUserBySocket(socket);
    const port = socket.remotePort;
    console.log(`${user.userId} - ${port}로 연결되었던 소켓 연결 해제됨`);
    if (user) {
      if (user.getCurrentGameId()) {
        // 게임 중 접속 종료 시 처리
        const gameSession = gameSessionManager.getGameSessionByGameId(user.getCurrentGameId());
        if (gameSession) {
          gameSession.endGameByDisconnect(user.getUserId());
        }
      }
      userSessionManager.removeUser(user.getUserId());
    }
  } catch (err) {
    handleErr(null, err);
  } finally {
    if (!socket.destroyed) {
      socket.destroy();
    }
  }
};
