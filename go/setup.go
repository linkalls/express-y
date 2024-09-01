package main

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "io/ioutil"
    "os"
    "os/exec"
    "strings"
)

func runCommand(name string, args ...string) error {
    cmd := exec.Command(name, args...)
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr
    return cmd.Run()
}

func replaceInFile(filepath, old, new string) error {
    input, err := ioutil.ReadFile(filepath)
    if err != nil {
        return err
    }

    output := strings.ReplaceAll(string(input), old, new)
    err = ioutil.WriteFile(filepath, []byte(output), 0644)
    return err
}

func generateRandomKey(length int) (string, error) {
    bytes := make([]byte, length)
    if _, err := rand.Read(bytes); err != nil {
        return "", err
    }
    return hex.EncodeToString(bytes), nil
}

func main() {
    fmt.Println("リポジトリをクローンしています...")
    err := runCommand("git", "clone", "https://github.com/iv-org/invidious.git")
    if err != nil {
        fmt.Printf("リポジトリのクローン中にエラーが発生しました: %v\n", err)
        return
    }

    fmt.Println("docker-compose.ymlを修正しています...")
    err = replaceInFile("invidious/docker-compose.yml", "127.0.0.1:3000:3000", "8080:3000")
    if err != nil {
        fmt.Printf("docker-compose.ymlの修正中にエラーが発生しました: %v\n", err)
        return
    }

    fmt.Println("ランダムなhmac_keyを生成しています...")
    hmacKey, err := generateRandomKey(32)
    if err != nil {
        fmt.Printf("hmac_keyの生成中にエラーが発生しました: %v\n", err)
        return
    }

    fmt.Println("docker-compose.ymlに新しいhmac_keyを書き込んでいます...")
    err = replaceInFile("invidious/docker-compose.yml", "CHANGE_ME!!", hmacKey)
    if err != nil {
        fmt.Printf("docker-compose.ymlの修正中にエラーが発生しました: %v\n", err)
        return
    }

    fmt.Println("docker compose up -dを実行しています...")
    err = runCommand("docker", "compose", "-f", "invidious/docker-compose.yml", "up", "-d")
    if err != nil {
        fmt.Printf("docker compose up -dの実行中にエラーが発生しました: %v\n", err)
        return
    }

    fmt.Println("セットアップが完了しました。Invidiousは http://localhost:8080/ で動作しています。")
}