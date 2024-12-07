class User {
  constructor(socket, userId) {
    this.socket = socket;
    this.userId = userId;
    this.currentGameId = null; // 유저가 참가한 게임 세션 id
    this.isMatchmaking = false;
    this.currentSpecies = null;
  }

  getSocket() {
    return this.socket;
  }

  getUserId() {
    return this.userId;
  }

  getCurrentGameId() {
    return this.currentGameId;
  }

  setCurrentGameId(gameId) {
    this.currentGameId = gameId;
  }

  getIsMatchmaking() {
    return this.isMatchmaking;
  }

  setIsMatchmaking(isMatchmaking) {
    this.isMatchmaking = isMatchmaking;
  }

  getCurrentSpecies() {
    return this.currentSpecies;
  }

  setCurrentSpecies(speices) {
    this.currentSpecies = speices;
  }
}

export default User;
