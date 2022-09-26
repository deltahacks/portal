import type { GetServerSidePropsContext, NextPage } from "next";
import dynamic from "next/dynamic";

const QrReaderDynamic = dynamic(() => import("../../components/QrScanner"), {
  ssr: false,
});

const QrScannerPage: NextPage = () => {
  return (
    <div>
      Qr Page
      <QrReaderDynamic></QrReaderDynamic>
    </div>
  );
};

export default QrScannerPage;
