import { handleErr } from '../../utils/error/handlerErr.js';
import { errCodes } from '../../utils/error/errCodes.js';
import CustomErr from '../../utils/error/customErr.js';
import locationSyncManager from '../../classes/managers/locationSyncManager.js';
import checkSessionInfo from '../../utils/sessions/checkSessionInfo.js';

/**
 * **위치 동기화 핸들러**
 * 
 * <위치 동기화 과정>
     1. 모든 유닛의 동기화 위치값 산출
        - `locationNotification`: 해당 플레이어가 보유한 유닛들의 현재 위치값을 수신 
        - `adjustPosition()`: 위치값을 보정
        - `addSyncPositions()`: 보정한 위치값 및 보정 여부를 서버에 저장
        - 위 과정을 두 플레이어가 모두 완료
     2. `isSyncReady()`: 위 과정을 완료했는지 확인
     3. `syncPositions()`: 위치 동기화 실행
        - 각 플레이어에게 새로운 위치값을 전송
          - 보유한 (직접 소환한) 유닛의 경우 위치가 보정된 위치값만 전송
          - 보유하지 않은 (상대방 진영의) 유닛의 경우 모든 위치값을 전송
        - 서버에 저장한 동기화 위치값을 삭제
     4. 각 플레이어는 수신한 위치값으로 해당 유닛들의 위치를 수정 (보간 적용)
 * @param {net.Socket} socket
 * @param {{unitPositions: {unitId: int32, position: {x: float, z: float}[]}}} payload
 */
const locationNotification = (socket, payload) => {
  try {
    const { gameId, userId, userGameData, opponentId, opponentSocket } = checkSessionInfo(socket);

    // 해당 클라이언트가 보유한 유닛들의 위치
    const { unitPositions } = payload;

    // 동기화할 위치값
    const syncPositions = [];

    // 각 유닛의 동기화 위치값을 계산
    for (const unitPosition of unitPositions) {
      // 클라이언트에서 보낸 유닛의 위치
      const { unitId, position } = unitPosition;

      // 검증: 해당 플레이어가 보유한 (소환한) 유닛인가?
      const unit = userGameData.getUnit(unitId);
      if (!unit) {
        throw new CustomErr(errCodes.UNOWNED_UNIT, '유저가 보유한 유닛이 아닙니다.');
      }

      const actualPosition = [position.x, 0, position.z]; // 실제 위치 (보유 클라이언트 기준)
      // TODO: 서버에서 예측한 유닛의 위치값
      const expectedPosition = [0, 0, 0]; // 예상 위치 (서버의 계산 기준)
      const marginOfError = [0, 0, 0]; // 오차 범위

      // 서버의 계산값과 비교하여 위치값을 보정
      const { adjustedPosition, modified } = locationSyncManager.adjustPosition(
        actualPosition,
        expectedPosition,
        marginOfError,
      );

      // 보정한 위치를 동기화 위치 배열에 추가
      const syncPosition = { unitId, position: adjustedPosition, modified };
      syncPositions.push(syncPosition);
    }

    // 동기화 위치값을 서버에 저장
    locationSyncManager.addSyncPositions(gameId, userId, syncPositions);

    // 두 클라이언트가 가진 모든 유닛의 동기화 위치값이 산출되었다면 위치 동기화 실행
    if (locationSyncManager.isSyncReady(gameId)) {
      locationSyncManager.syncPositions(gameId, userId, opponentId, socket, opponentSocket);
    }
  } catch (err) {
    handleErr(socket, err);
  }
};

export default locationNotification;
