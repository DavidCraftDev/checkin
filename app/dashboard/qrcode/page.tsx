import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import QRCode from './qr.component';

export default async function QR() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  const userID: string = session.user.id;
  const displayname: string = session.user.name;
  const username: string = session.user.username;

  return (
    <div className="text-black">
      <p >QR</p>
      <QRCode data={ "checkin://" + userID}/>
      <p>{ displayname }</p>
      <p>{ "Alternaive per Nutzername: " + username }</p>
    </div>
  );
}