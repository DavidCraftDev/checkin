import { redirect } from "next/navigation";
import QRCode from './qr.component';
import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";

async function qrcode() {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');
  return (
    <div>
      <h1>QR-Code</h1>
      <div className="text-center w-full md:w-1/3">
        <QRCode data={`checkin://${user.id}`} />
        <p>{user.displayname}</p>
        <p>{`Nutzername: ${user.username}`}</p>
      </div>
    </div>
  );
}

export default qrcode;