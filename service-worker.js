"use strict";


/*
캐시 버전.

index.html이나 계산 로직을 크게 수정했는데
설치된 PWA가 옛날 버전을 계속 보여주면
v11-pwa-1 → v11-pwa-2처럼 올리면 됨.
*/

const CACHE_NAME =
  "nutrient-calculator-v11-pwa-1";


const APP_SHELL = [

  "./",
  "./index.html",
  "./manifest.json",

  "./icon-192.png",
  "./icon-512.png"

];



/*
========================================

INSTALL

========================================
*/


self.addEventListener(

  "install",

  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(
          cache =>
            cache.addAll(APP_SHELL)
        )

    );


    self.skipWaiting();

  }

);



/*
========================================

ACTIVATE

이전 버전 캐시 삭제

========================================
*/


self.addEventListener(

  "activate",

  event => {

    event.waitUntil(

      caches
        .keys()

        .then(

          keys =>

            Promise.all(

              keys

                .filter(
                  key =>
                    key !== CACHE_NAME
                )

                .map(
                  key =>
                    caches.delete(key)
                )

            )

        )

    );


    self.clients.claim();

  }

);



/*
========================================

FETCH

Network First

인터넷 연결:
최신 GitHub Pages 파일 사용

오프라인:
캐시된 PWA 사용

========================================
*/


self.addEventListener(

  "fetch",

  event => {


    if (
      event.request.method
      !==
      "GET"
    ) {

      return;

    }


    event.respondWith(

      fetch(event.request)

        .then(

          response => {


            /*
            정상 응답만 캐시
            */

            if (
              response
              &&
              response.status === 200
            ) {

              const copy =
                response.clone();


              caches
                .open(CACHE_NAME)

                .then(

                  cache => {

                    cache.put(
                      event.request,
                      copy
                    );

                  }

                );

            }


            return response;

          }

        )


        .catch(

          async () => {


            /*
            네트워크 실패 →
            캐시 검색
            */

            const cached =
              await caches.match(
                event.request
              );


            if (cached) {

              return cached;

            }


            /*
            페이지 이동 요청이면
            index.html fallback
            */

            if (
              event.request.mode
              ===
              "navigate"
            ) {

              return caches.match(
                "./index.html"
              );

            }

          }

        )

    );

  }

);
