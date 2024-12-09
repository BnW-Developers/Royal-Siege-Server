import CustomErr from '../error/customErr.js';
import { ERR_CODES } from '../error/errCodes.js';

/**
 * 두 좌표 사이의 직선거리를 이동한 속도를 반환
 * @param {{x: float, z: float}} pos1 위치 (전)
 * @param {{x: float, z: float}} pos2 위치 (후)
 * @param {number} timeTaken 걸린 시간 (ms)
 * @returns {float}
 */
const calcSpd = (pos1, pos2, timeTaken) => {
  // 검증: 좌표의 형식이 올바른가?
  if (!pos1 || pos1.x === null || pos1.z === null) {
    throw new Error('잘못된 좌표입니다: pos1', pos1);
  }

  if (!pos2 || pos2.x === null || pos2.z === null) {
    throw new Error('잘못된 좌표입니다: pos1', pos2);
  }

  // 검증: 걸린 시간이 0보다 큰가?
  if (timeTaken <= 0) {
    throw CustomErr(ERR_CODES.INVALID_TIME, '잘못된 시간입니다: timeTaken', timeTaken);
  }

  // √((x1-x2)^2 + (z1-z2)^2)
  const distance = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.z - pos2.z) ** 2);
  const speed = distance / (timeTaken / 1000);
  return speed;
};

export default calcSpd;
