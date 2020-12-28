const state = {
    userName: ""
  };
  
  const mutations = {
    doLogout(state) {
      state.userName = ""
    },
    doLogin(state, userName) {
      state.userName = userName;
    }
  };
  
  export default {
    state,
    mutations
  }