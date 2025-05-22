
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
  interface Window {
    daum: any;
  }
}

interface PostcodeSearchProps {
  onComplete: (data: any) => void;
}

export const PostcodeSearch: React.FC<PostcodeSearchProps> = ({ onComplete }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // 이미 스크립트가 로드되어 있는지 확인
    if (window.daum && window.daum.Postcode) {
      setIsScriptLoaded(true);
      return;
    }

    // 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      toast.error("우편번호 서비스를 불러오는데 실패했습니다.");
    };
    
    document.body.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      // 이미 다른 곳에서 사용 중일 수 있으므로 스크립트는 제거하지 않음
    };
  }, []);

  const handleClick = () => {
    if (!isScriptLoaded) {
      toast.error("우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: onComplete,
      width: '100%',
      height: '100%'
    }).open();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="w-full h-12"
      disabled={!isScriptLoaded}
    >
      우편번호 검색
    </Button>
  );
};
