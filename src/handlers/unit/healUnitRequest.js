import { UNIT_TYPE } from '../../constants/assets.js';
import { PACKET_TYPE } from '../../constants/header.js';
import CustomErr from '../../utils/error/customErr.js';
import { ERR_CODES } from '../../utils/error/errCodes.js';
import { handleErr } from '../../utils/error/handlerErr.js';
import { sendPacket } from '../../utils/packet/packetManager.js';
import checkSessionInfo from '../../utils/sessions/checkSessionInfo.js';
import validateTarget from '../../utils/unit/validationTarget.js';

const healUnitRequest = (socket, payload) => {
  try {
    const { unitId, timestamp, targetId, healAmount: initialHealAmount } = payload;
    let healAmount = initialHealAmount;

    const { userGameData, opponentSocket } = checkSessionInfo(socket);

    // 힐러 유닛과 대상 유닛 가져오기
    const healerUnit = userGameData.getUnit(unitId);

    const targetUnit = userGameData.getUnit(targetId);

    if (!healerUnit) {
      throw new CustomErr(ERR_CODES.UNIT_NOT_FOUND, 'Unit not found');
    }

    // 유닛이 힐러 타입인지 검증
    if (healerUnit.getType() !== UNIT_TYPE.HEALER) {
      throw new Error('Unit Type Error');
    }

    // 존재, 라인, 사거리 검증 or 쿨타임 검증
    if (!validateTarget(healerUnit, targetUnit) || !healerUnit.isSkillAvailable(timestamp))
      healAmount = 0;

    // 힐 로직
    const afterHealHp = targetUnit.applyHeal(healAmount);

    // 마지막 스킬 사용시간 초기화 (실패든 성공이든)
    healerUnit.resetLastSkillTime(timestamp);

    // 리스폰스 전송
    sendPacket(socket, PACKET_TYPE.HEAL_UNIT_RESPONSE, {
      unitId: targetId,
      unitHp: afterHealHp,
    });

    // 노티피케이션 전송
    sendPacket(opponentSocket, PACKET_TYPE.ENEMY_HEAL_UNIT_NOTIFICATION, {
      unitId: targetId,
      unitHp: afterHealHp,
    });
  } catch (err) {
    handleErr(socket, err);
  }
};

export default healUnitRequest;
