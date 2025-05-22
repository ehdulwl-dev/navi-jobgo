import React, { useState } from "react";
import { ChevronDown, ChevronUp, Briefcase, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface JobFiltersProps {
  onFilterChange: (filterType: "jobType" | "region", value: string[]) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange }) => {
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const jobTypes = [
    "기획·전략",
    "마케팅·홍보",
    "영업·판매·무역",
    "상품기획·MD",
    "고객상담·TM",
    "구매·자재·물류",
    "건설·건축",
    "의료",
    "연구·R&D",
    "회계·세무·재무",
    "인사·노무·HRD",
    "총무·법무·사무",
    "IT개발·데이터",
    "디자인",
    "서비스",
    "교육",
    "미디어·문화·스포츠",
    "금융·보험",
    "생산",
    "공공·복지",
    "운전·운송·배송",
  ].sort((a, b) => a.localeCompare(b, "ko")); // 한글 자모음 순으로 정렬

  const seoulDistricts = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ].sort((a, b) => a.localeCompare(b, "ko")); // 한글 자모음 순으로 정렬

  const toggleSelection = (
    current: string[],
    setFunc: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    filterType: "jobType" | "region"
  ) => {
    let updated: string[];
    if (value === "all") {
      updated = [];
    } else {
      updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    }
    setFunc(updated);
    onFilterChange(filterType, updated);
  };

  const isAllSelected = (list: string[], allItems: string[]) =>
    list.length === 0 || list.length === allItems.length;

  const isActive = (selected: string[]) => selected.length > 0;

  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [jobTypePopoverOpen, setJobTypePopoverOpen] = useState(false);

  return (
    <div className="flex gap-3 justify-center mb-4">
      {/* 직업 선택 */}
      <Popover open={jobTypePopoverOpen} onOpenChange={setJobTypePopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-[180px] h-10 flex items-center justify-between border-2 rounded-full cursor-pointer px-3 ${
              isActive(selectedJobTypes) ? "border-app-blue" : "border-gray-300"
            }`}
          >
            <Briefcase
              size={20}
              className={`shrink-0 ${
                isActive(selectedJobTypes) ? "text-app-blue" : "text-gray-400"
              }`}
            />
            <div className="w-full text-center">
              <span
                className={`ml-2 text-m truncate ${
                  isActive(selectedJobTypes) ? "text-app-blue" : "text-gray-500"
                }`}
              >
                {isAllSelected(selectedJobTypes, jobTypes)
                  ? "직업 선택"
                  : selectedJobTypes.join(", ")}
              </span>
            </div>
            {jobTypePopoverOpen ? (
              <ChevronUp
                size={18}
                className={`${
                  isActive(selectedJobTypes) ? "text-app-blue" : "text-gray-400"
                }`}
              />
            ) : (
              <ChevronDown
                size={18}
                className={`${
                  isActive(selectedJobTypes) ? "text-app-blue" : "text-gray-400"
                }`}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedJobTypes.length === 0}
                onCheckedChange={() =>
                  toggleSelection(
                    selectedJobTypes,
                    setSelectedJobTypes,
                    "all",
                    "jobType"
                  )
                }
              />
              <span className="text-sm">전체 선택</span>
            </div>
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedJobTypes.includes(type)}
                  onCheckedChange={() =>
                    toggleSelection(
                      selectedJobTypes,
                      setSelectedJobTypes,
                      type,
                      "jobType"
                    )
                  }
                />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* 지역 선택 */}
      <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-[180px] h-10 flex items-center justify-between border-2 rounded-full cursor-pointer px-3 ${
              isActive(selectedRegions) ? "border-app-blue" : "border-gray-300"
            }`}
          >
            <MapPin
              size={20}
              className={`shrink-0 ${
                isActive(selectedRegions) ? "text-app-blue" : "text-gray-400"
              }`}
            />
            <div className="w-full text-center">
              <span
                className={`ml-2 text-m truncate ${
                  isActive(selectedRegions) ? "text-app-blue" : "text-gray-500"
                }`}
              >
                {isAllSelected(selectedRegions, seoulDistricts)
                  ? "지역 선택"
                  : selectedRegions.join(", ")}
              </span>
            </div>
            {regionPopoverOpen ? (
              <ChevronUp
                size={18}
                className={`${
                  isActive(selectedRegions) ? "text-app-blue" : "text-gray-400"
                }`}
              />
            ) : (
              <ChevronDown
                size={18}
                className={`${
                  isActive(selectedRegions) ? "text-app-blue" : "text-gray-400"
                }`}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedRegions.length === 0}
                onCheckedChange={() =>
                  toggleSelection(
                    selectedRegions,
                    setSelectedRegions,
                    "all",
                    "region"
                  )
                }
              />
              <span className="text-sm">전체 선택</span>
            </div>
            {seoulDistricts.map((district) => (
              <div key={district} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedRegions.includes(district)}
                  onCheckedChange={() =>
                    toggleSelection(
                      selectedRegions,
                      setSelectedRegions,
                      district,
                      "region"
                    )
                  }
                />
                <span className="text-sm">{district}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default JobFilters;
