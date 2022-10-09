const initialState = {
  playlist: [],
};

export const playlistReducer = (state = initialState, actions) => {
  const getPlaylistFromServer = () => {
    console.log("GONINT TOS SERVER");
  };

  switch (actions.type) {
    case "GET_PLAYLIST":
      return console.log("GONINT TOS SERVER");

    default:
      return state;
  }
};
