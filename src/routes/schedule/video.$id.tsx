import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@remix-run/react";
import Modal from "~/components/shared/Modal";
import Button from "~/components/shared/Button";
import { useUser } from "~/context/user";

export default function View() {
  const params = useParams();
  const navigate = useNavigate();
  const { supabaseClient } = useUser();
  const [video, setVideo] = useState<string>();

  const handleClose = () => navigate("..");

  useEffect(() => {
    if (supabaseClient === null) return;

    supabaseClient.storage
      .from("videos")
      .createSignedUrl(`${params.id}.mp4`, 60)
      .then(({ data, error }) => {
        if (data) {
          setVideo(data.signedUrl);
        }
      });
  }, [supabaseClient, params.id]);

  return (
    <Modal title="View Video" onClose={handleClose}>
      {video ? (
        <video controls autoPlay className="w-full bg-black my-4">
          <source src={video} type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
      ) : (
        <div className="bg-black w-full h-[225px]">&nbsp;</div>
      )}
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={handleClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
