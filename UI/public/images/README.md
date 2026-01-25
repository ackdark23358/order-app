# 이미지 파일 안내

## 이미지 파일 위치

이미지 파일 6개를 다음 폴더에 넣어주세요:

```
UI/public/images/
```

## 권장 파일명

메뉴 ID에 맞춰서 파일명을 지정하시면 됩니다:

1. **아메리카노(ICE)** → `menu-1.jpg` (또는 `americano-ice.jpg`)
2. **아메리카노(HOT)** → `menu-2.jpg` (또는 `americano-hot.jpg`)
3. **카페라떼** → `menu-3.jpg` (또는 `cafe-latte.jpg`)
4. **카푸치노** → `menu-4.jpg` (또는 `cappuccino.jpg`)
5. **카라멜 마키아토** → `menu-5.jpg` (또는 `caramel-macchiato.jpg`)
6. **바닐라 라떼** → `menu-6.jpg` (또는 `vanilla-latte.jpg`)

## 지원하는 이미지 형식

- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

## 파일 구조 예시

```
UI/
  public/
    images/
      menu-1.jpg    (아메리카노 ICE)
      menu-2.jpg    (아메리카노 HOT)
      menu-3.jpg    (카페라떼)
      menu-4.jpg    (카푸치노)
      menu-5.jpg    (카라멜 마키아토)
      menu-6.jpg    (바닐라 라떼)
```

## 참고사항

- 이미지 파일을 `UI/public/images/` 폴더에 넣으시면 자동으로 화면에 표시됩니다.
- 파일명은 메뉴 ID에 맞춰서 지정하시면 됩니다 (menu-{id}.jpg 형식 권장).
- 이미지가 없으면 기본 커피 아이콘(☕)이 표시됩니다.
