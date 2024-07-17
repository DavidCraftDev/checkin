import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import QRCode from './qr.component';

async function qrcode() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const userID = session.user.id;
  const displayname = session.user.name;
  const username = session.user.username;

  return (
    <div>
      <h1>QR-Code</h1>
      <div className="text-center w-full md:w-1/3">
        <QRCode data={`checkin://${userID}`} />
        <p>{displayname}</p>
        <p>{`Nutzername: ${username}`}</p>
      </div>
    </div>
  );
}

export default qrcode;