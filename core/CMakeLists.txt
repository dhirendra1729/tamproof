cmake_minimum_required(VERSION 3.16)
project(evidence_vault_core CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enforce strict compiler warnings and errors per specification
if(MSVC)
    add_compile_options(/W4 /WX)
else()
    add_compile_options(-Wall -Wextra -Werror)
endif()

include_directories(include src)

# Core engine library
add_library(vault_engine_lib STATIC
    src/sha256.cpp
    src/MerkleTree.cpp
    src/HashChain.cpp
    src/Huffman.cpp
    src/protocol.cpp
    src/VaultCore.cpp
)

# vault_core binary
add_executable(vault_core
    src/main.cpp
)
target_link_libraries(vault_core PRIVATE vault_engine_lib)

# selftest binary
add_executable(selftest
    tests/selftest.cpp
)
target_link_libraries(selftest PRIVATE vault_engine_lib)
