BIN_NAME=gocron

.PHONY: build
build: gocron node

.PHONY: build-linux
build-linux: gocron-linux node-linux

.PHONY: build-race
build-race: enable-race build

.PHONY: run
run: build kill
	# ./bin/gocron-node &
	./bin/gocron web -e dev

.PHONY: run-race
run-race: enable-race run

.PHONY: kill
kill:
	-killall gocron-node

.PHONY: gocron
gocron:
	go build $(RACE) -o bin/gocron ./cmd/gocron

.PHONY: node
node:
	go build $(RACE) -o bin/gocron-node ./cmd/node

.PHONY: gocron-linux
gocron-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build $(RACE) -o bin/gocron ./cmd/gocron

.PHONY: node-linux
node-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build $(RACE) -o bin/gocron-node ./cmd/node

.PHONY: test
test:
	go test $(RACE) ./...

.PHONY: test-race
test-race: enable-race test

.PHONY: enable-race
enable-race:
	$(eval RACE = -race)

.PHONY: package
package: build-react statik
	bash ./package.sh

.PHONY: package-all
package-all: build-react statik
	bash ./package.sh -p 'linux darwin windows'

.PHONY: build-vue
build-vue:
	cd web/vue && yarn run build
	cp -r web/vue/dist/* web/public/

.PHONY: install-vue
install-vue:
	cd web/vue && yarn install

.PHONY: run-vue
run-vue:
	cd web/vue && yarn run dev

.PHONY: install-react
install-react:
	cd web/react && yarn install

.PHONY: run-react
run-react:
	cd web/react && yarn run start

.PHONY: build-react
build-react:
	cd web/react && yarn run build
	cp -r web/react/dist/* web/public/			


.PHONY: statik
statik:
	go get github.com/rakyll/statik
	go generate ./...

.PHONY: clean
clean:
	rm bin/gocron
	rm bin/gocron-node

.PHONY:zip
zip:
	zip -r ${BIN_NAME} bin conf >/dev/null
