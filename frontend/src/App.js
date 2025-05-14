import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  Button,
  Field,
  Pagination,
  Table,
  ButtonGroup,
  IconButton,
  Input,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

function App() {
  const [formData, setFormData] = useState({
    rletTpCd: "",
    tradTpCd: "",
    zoom_level: "",
    lat: "",
    lon: "",
  });
  const [listings, setListings] = useState([]);
  const [filePath, setFilePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const currentItems = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setListings([]);
    setFilePath("");

    try {
      const response = await axios.post(
        "http://localhost:8000/crawl",
        formData
      );
      setListings(response.data.listings);
      setFilePath(response.data.file_url);
      console.log(response.data.file_url);
      setCurrentPage(1); // 데이터 로드 후 페이지 리셋
    } catch (err) {
      setError(err.response?.data?.detail || "API 호출 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack gap={4} p={8}>
      <Heading size={"3xl"}>네이버 부동산 매물 크롤링</Heading>
      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <HStack>
            <Field.Root>
              <Field.Label>매물 종류</Field.Label>
              <Field.RequiredIndicator />
              <Input
                type="text"
                name="rletTpCd"
                value={formData.rletTpCd}
                onChange={handleChange}
                required
              />
              <Field.HelperText>매물 종류를 입력하세요.</Field.HelperText>
              <Field.ErrorText>이 필드는 필수입니다.</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>거래 유형</Field.Label>
              <Field.RequiredIndicator />
              <Input
                type="text"
                name="tradTpCd"
                value={formData.tradTpCd}
                onChange={handleChange}
                required
              />
              <Field.HelperText>거래 유형을 입력하세요.</Field.HelperText>
              <Field.ErrorText>이 필드는 필수입니다.</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>줌 레벨</Field.Label>
              <Field.RequiredIndicator />
              <Input
                type="text"
                name="zoom_level"
                value={formData.zoom_level}
                onChange={handleChange}
                required
              />
              <Field.HelperText>줌 레벨을 입력하세요.</Field.HelperText>
              <Field.ErrorText>이 필드는 필수입니다.</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>중심 위도</Field.Label>
              <Field.RequiredIndicator />
              <Input
                type="text"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                required
              />
              <Field.HelperText>위도를 입력하세요.</Field.HelperText>
              <Field.ErrorText>이 필드는 필수입니다.</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>중심 경도</Field.Label>
              <Field.RequiredIndicator />
              <Input
                type="text"
                name="lon"
                value={formData.lon}
                onChange={handleChange}
                required
              />
              <Field.HelperText>경도를 입력하세요.</Field.HelperText>
              <Field.ErrorText>이 필드는 필수입니다.</Field.ErrorText>
            </Field.Root>
          </HStack>

          <HStack justifyContent={"center"} gap={4}>
            <Button type="submit" isDisabled={loading} size={"lg"}>
              {loading ? "크롤링 중..." : "크롤링 시작"}
            </Button>
            {filePath && (
              <a
                href={`http://localhost:8000${filePath}`}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                엑셀 다운로드
              </a>
            )}
          </HStack>
        </VStack>
      </form>
      {error && <p className="error">{error}</p>}

      <Table.ScrollArea borderWidth="1px" borderRadius={"lg"}>
        <Table.Root size="lg">
          <Table.Header>
            <Table.Row>
              {[
                "매물 번호",
                "매물 이름",
                "층 정보",
                "가격 (만 원)",
                "면적 (m²)",
                "방향",
                "특징 설명",
                "태그",
                "중개업소",
                "거래 유형",
                "매물 상태",
              ].map((header) => (
                <Table.ColumnHeader key={header}>{header}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentItems.map((item, idx) => (
              <Table.Row key={idx}>
                {Object.keys(item).map((key) => (
                  <Table.Cell key={key}>{item[key]}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {totalPages > 1 && (
        <Pagination.Root
          count={totalPages}
          pageSize={1}
          page={currentPage}
          onPageChange={setCurrentPage}
        >
          <ButtonGroup variant="ghost" size="sm">
            <IconButton
              icon={<LuChevronLeft />}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, i) => (
              <IconButton
                key={i}
                variant={i + 1 === currentPage ? "solid" : "ghost"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </IconButton>
            ))}
            <IconButton
              icon={<LuChevronRight />}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              isDisabled={currentPage === totalPages}
            />
          </ButtonGroup>
        </Pagination.Root>
      )}
    </VStack>
  );
}

export default App;
