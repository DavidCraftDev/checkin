import { redirect } from "next/navigation";
import QRCodeComponent from "./qr.component";
import { getCurrentSession } from "../../src/modules/auth/cookieManager";

async function QRCodePage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  return (
    <div>
      <h1>QR-Code</h1>
      <div className="text-center w-full md:w-1/3">
        <QRCodeComponent data={"checkin://" + user.id} />
        <p>{user.displayname}</p>
        <p>Nutzername: {user.username}</p>
      </div>
    </div>
  );
}

export default QRCodePage;