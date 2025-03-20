import { useCreateGame, useGames } from '../api/lobbyApi';
import Alert from '../components/Alert';
import Button from '../components/Button';

const CREATE_GAME_MODAL = 'create_game_modal';
const getCreateGameModal = () =>
  document.getElementById(CREATE_GAME_MODAL) as HTMLDialogElement;

const CreateGameModal = ({ refetch }: { refetch: () => void }) => {
  const { mutateAsync: createGame, isPending } =
    useCreateGame(refetch);

  const handleCreateGame = async () => {
    try {
      await createGame({});
      getCreateGameModal().close();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <dialog id={CREATE_GAME_MODAL} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          Do you want to create a game?
        </h3>
        <p className="py-4">
          Clicking "Create" button below will automatically create
          game.
        </p>
        <div className="modal-action">
          <form method="dialog">
            <Button
              type="button"
              loading={isPending}
              onClick={handleCreateGame}
            >
              Create
            </Button>
          </form>
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <Button type="submit" variant='btn-secondary' loading={isPending}>Close</Button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

const GameLobbyPage = () => {
  const { data: openGames, isLoading, error, refetch } = useGames();

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Error loading games. Please try again."
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="flex justify-between items-center p-4 pb-2 text-xs opacity-60 tracking-wide">
          Current Games
          <div className="w-52">
            <Button
              variant="btn-success"
              onClick={() => getCreateGameModal().showModal()}
            >
              Create Game
            </Button>
            <CreateGameModal refetch={refetch} />
          </div>
        </li>

        {openGames?.map((game) => {
          return (
            <li key={game.id} className="list-row">
              <div>
                <div>Game {game.id}</div>
                <div className="text-xs uppercase font-semibold opacity-60">
                  {game.players?.length} players
                </div>
              </div>
              <div className="ml-auto flex items-center">{game.status}</div>
              <Button variant='btn-secondary'>Join</Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GameLobbyPage;
