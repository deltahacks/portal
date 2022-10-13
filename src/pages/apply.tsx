import type { NextPage } from "next";
import dynamic from "next/dynamic";

const Widget = dynamic(() => import('../components/TypeformWidget'), { ssr: false });

const Apply: NextPage = () => {
  return (
    <Widget id="vBfgzBit" style={{ borderRadius: 'none', width: '100%', height: '100%' }} className="rounded-none" />
  );
};

export default Apply