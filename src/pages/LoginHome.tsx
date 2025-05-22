
import logo from "@/assets/logo/logo.png";
import logo_land from "@/assets/logo/logo_land.png";
import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => (
  <header style={{ backgroundColor: "#E0EFFF" }} className="h-[115px] w-full" />
);


const IntroSection: React.FC = () => (
  <section className="flex flex-col gap-10 mt-14 px-6 items-center">
    <h1 className="text-2xl font-bold leading-10 max-w-[22rem] text-center">
      {/* 로고 + 나비잡고 부분 */}
      <span className="inline-flex items-center justify-center">
        <img
          src={logo_land}
          alt="Navi Logo"
          className="h-7 mr-1 inline-block"
        />
        <span className="text-2xl font-bold text-black">의 간편한 이력서로</span>
      </span>
      <br />
      <span className="text-2xl font-bold text-black">맞춤형 일자리를 찾아보세요!</span>
    </h1>

    <p className="text-lg leading-8 text-neutral-800 max-w-[22rem] text-center">
      음성 입력과 AI가 알아서 작성해주는
      <br />
      최적의 간편 이력서!
    </p>
  </section>
);


const ImageSection: React.FC = () => (
  <section className="flex justify-center mt-14">
    <img
      src={logo}
      className="h-[168px] w-[205px]"
      alt="image 3"
    />
  </section>
);

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center mt-16">
      <p className="text-xl text-center text-neutral-800 max-w-[22rem]">
        <span className="text-2xl font-bold text-black">누구나</span> 할 수 있어요.
        <br />
        지금 <span className="text-2xl font-bold text-black">시작</span> 해보세요!
      </p>
      <button
        className="mt-[7rem] p-3 text-lg font-bold text-blackrounded-md max-w-[22rem] w-full rounded"
        style={{backgroundColor:'#399CFF', color:'white'}}
        onClick={() => {
          navigate("/LoginPage");
        }}
      >
        시작하기
      </button>
    </section>
  );
};

const LoginHome: React.FC = () => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&family=Bruno+Ace+SC&display=swap"
      />
      <main className="pb-20">
        <Header />
        <IntroSection />
        <ImageSection />
        <CallToAction />
      </main>
    </>
  );
};

export default LoginHome;
