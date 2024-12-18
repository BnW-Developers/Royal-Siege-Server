import { ASSET_TYPE, SPELL_TYPE } from '../../constants/assets.js';
import { gameAssets } from '../../init/loadAssets.js';
import CustomErr from '../error/customErr.js';
import { ERR_CODES } from '../error/errCodes.js';
import { SPECIES, DIRECTION } from '../../constants/assets.js';

/**
 * 로드한 게임에셋 전체를 조회하는 함수
 * @returns {{animations: {}, buildings: {}, maps: {}, paths: {}, spells: {}, units: {}}} JSON화된 모든 게임에셋
 */
export const getAllGameAssets = () => {
  return gameAssets;
};

/**
 * 특정 게임에셋을 조회하는 함수
 *
 * 호출 예시: `const units = getGameAsset(ASSET_TYPE.UNIT);`
 * @param {ASSET_TYPE} assetType 조회할 게임에셋 타입
 * @returns {{name: string, version: string, data: {}}}} JSON화된 게임에셋
 */
export const getGameAsset = (assetType) => {
  const { animations, buildings, maps, paths, spells, units } = getAllGameAssets();

  switch (assetType) {
    case ASSET_TYPE.ANIMATION:
      return animations;
    case ASSET_TYPE.BUILDING:
      return buildings;
    case ASSET_TYPE.MAP:
      return maps;
    case ASSET_TYPE.PATH:
      return paths;
    case ASSET_TYPE.SPELL:
      return spells;
    case ASSET_TYPE.UNIT:
      return units;
    default:
      throw new CustomErr(
        ERR_CODES.INVALID_ASSET_TYPE,
        '올바르지 않은 게임에셋 타입입니다:',
        assetType,
      );
  }
};

/**
 * 게임에셋의 특정 데이터를 id로 조회하는 함수
 *
 * 호출 예시: `const unitData = getGameAssetById(ASSET_TYPE.UNIT, 2003);`
 * @param {ASSET_TYPE} assetType 조회할 게임에셋 타입
 * @param {string} id 조회할 항목의 id
 * @returns {JSON} 해당 id의 데이터 ( 예시: `{ id: 2003, DisplayName: "불 테리어", ... }` )
 */
export const getGameAssetById = (assetType, id) => {
  const { animations, buildings, maps, paths, spells, units } = getAllGameAssets();

  let data = null;
  switch (assetType) {
    case ASSET_TYPE.ANIMATION:
      data = animations.data.find((animation) => animation.id === id);
      break;
    case ASSET_TYPE.BUILDING:
      data = buildings.data.find((building) => building.id === id);
      break;
    case ASSET_TYPE.MAP:
      data = maps.data.find((map) => map.id === id);
      break;
    case ASSET_TYPE.PATH:
      data = paths.data.find((path) => path.id === id);
      break;
    case ASSET_TYPE.SPELL:
      data = spells.data.find((spell) => spell.id === id);
      break;
    case ASSET_TYPE.UNIT:
      data = units.data.find((unit) => unit.id === id);
      break;
    default:
      throw new CustomErr(
        ERR_CODES.INVALID_ASSET_TYPE,
        '올바르지 않은 게임에셋 타입입니다:',
        assetType,
      );
  }
  if (!data) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_ID, '올바르지 않은 게임에셋 ID입니다:', id);
  }
  return data;
};

/**
 * 진영과 방향에 부합하는 경로를 반환
 *
 * 호출 예시: `const path = getPath(SPECIES.DOG, DIRECTION.UP);`
 * @param {SPECIES} species 진영 (개 또는 고양이)
 * @param {DIRECTION} direction 소환위치 (위 또는 아래)
 * @returns {{x: float, z: float}[]} 경로
 */
export const getPath = (species, direction) => {
  // 검증: 파라미터 유효성
  if (!Object.values(SPECIES).includes(species)) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_TYPE, '올바르지 않은 종족입니다:', species);
  }
  if (!Object.values(DIRECTION).includes(direction)) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_TYPE, '올바르지 않은 방향입니다:', direction);
  }

  const paths = getGameAsset(ASSET_TYPE.PATH);
  const pathData = paths.data.find(
    (path) => path.species === species && path.direction === direction,
  );
  return pathData.path;
};

/**
 * 경로에 맞는 모퉁이 영역 좌표를 반환
 *
 * 영역을 이루는 4개의 좌표는 항상 NW -> NE -> SE -> SW 의 순서로 정렬되어 있음
 *
 * 호출 예시: `const corners = getMapCorners(SPECIES.DOG, DIRECTION.UP);`
 * @param {SPECIES} species 진영 (개 또는 고양이)
 * @param {DIRECTION} direction 소환위치 (위 또는 아래)
 * @returns {{x: float, z: float}[4][]} 모퉁이 영역의 배열
 */
export const getMapCorners = (species, direction) => {
  // 검증: 파라미터 유효성
  if (!Object.values(SPECIES).includes(species)) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_TYPE, '올바르지 않은 종족입니다:', species);
  }
  if (!Object.values(DIRECTION).includes(direction)) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_TYPE, '올바르지 않은 방향입니다:', direction);
  }

  // TODO: 다수의 맵을 지원할 시 mapId 인자 추가, 패킷명세, 게임세션 등 코드수정이 필요
  // 현재는 하나의 맵만 지원하므로 해당 ID (5001)를 하드코딩
  const mapData = getGameAssetById(ASSET_TYPE.MAP, 5001);

  if (species === SPECIES.DOG && direction === DIRECTION.UP) {
    return [mapData.NWCorner, mapData.NECorner];
  } else if (species === SPECIES.DOG && direction === DIRECTION.DOWN) {
    return [mapData.SWCorner, mapData.SECorner];
  } else if (species === SPECIES.CAT && direction === DIRECTION.UP) {
    return [mapData.NECorner, mapData.NWCorner];
  } else if (species === SPECIES.CAT && direction === DIRECTION.DOWN) {
    return [mapData.SECorner, mapData.SWCorner];
  }
};

/**
 * 맵의 경계를 구성하는 좌표를 반환
 *
 * 각 경계를 이루는 4개의 좌표는 항상 NW -> NE -> SE -> SW 의 순서로 정렬되어 있음
 *
 * 호출 예시: `const { outerBound, innerBound } = getMapBounds();`
 *
 * @returns { {centerLine: {z: float} , outerBound: {x: float, z: float}[4], innerBound: {x: float, z: float}[4]}}
 */
export const getMapBounds = () => {
  // TODO: 다수의 맵을 지원할 시 mapId 인자 추가, 패킷명세, 게임세션 등 코드수정이 필요
  // 현재는 하나의 맵만 지원하므로 해당 ID (5001)를 하드코딩
  const mapData = getGameAssetById(ASSET_TYPE.MAP, 5001);
  return {
    centerLine: mapData.centerLine,
    outerBound: mapData.outerBound,
    innerBound: mapData.innerBound,
  };
};

/**
 * 특정 스펠의 데이터를 반환
 *
 * 호출 예시: `const spellData = getSpell(SPELL_TYPE.HEAL);`
 * @param {SPELL_TYPE} spellType 조회할 스펠 종류
 * @returns {JSON} 스펠 데이터 ( 예시: `{ id: 7002, DisplayName: "힐 스펠", ... }` )
 */
const getSpell = (spellType) => {
  // 검증: 파라미터 유효성
  if (!Object.values(SPELL_TYPE).includes(spellType)) {
    throw new CustomErr(ERR_CODES.INVALID_ASSET_TYPE, '올바르지 않은 스펠입니다:', spellType);
  }

  return getGameAssetById(ASSET_TYPE.SPELL, spellType);
};

/**
 * 유저 스펠 데이터를 초기화
 * @returns { Map<SPELL_TYPE, { type: SPELL_TYPE, damage?: number, healAmount?: number, buffAmount?: number, duration?: number, range: number, cost: number, cooldown: number, lastSpellTime: timestamp }> } 스펠 데이터
 */
export const initializeSpells = () => {
  const spellData = new Map();

  const attackSpell = getSpell(SPELL_TYPE.ATTACK);
  {
    const { id, damage, range, cd, cost } = attackSpell;
    spellData.set(SPELL_TYPE.ATTACK, {
      type: id,
      damage,
      range,
      cost,
      cooldown: cd,
      lastSpellTime: 0,
    });
  }

  const healSpell = getSpell(SPELL_TYPE.HEAL);
  {
    const { id, healAmount, range, cd, cost } = healSpell;
    spellData.set(SPELL_TYPE.HEAL, {
      type: id,
      healAmount,
      range,
      cost,
      cooldown: cd,
      lastSpellTime: 0,
    });
  }

  const buffSpell = getSpell(SPELL_TYPE.BUFF);
  {
    const { id, buffAmount, range, duration, cd, cost } = buffSpell;
    spellData.set(SPELL_TYPE.BUFF, {
      type: id,
      buffAmount,
      range,
      duration,
      cost,
      cooldown: cd,
      lastSpellTime: 0,
    });
  }

  const stunSpell = getSpell(SPELL_TYPE.STUN);
  {
    const { id, range, duration, cd, cost } = stunSpell;
    spellData.set(SPELL_TYPE.STUN, {
      type: id,
      range,
      duration,
      cost,
      cooldown: cd,
      lastSpellTime: 0,
    });
  }

  return spellData;
};
