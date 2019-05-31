cmake_minimum_required(VERSION 2.6 FATAL_ERROR)

project(correspondence_grouping)

find_package(PCL 1.5 REQUIRED)

include_directories(${PCL_INCLUDE_DIRS})
link_directories(${PCL_LIBRARY_DIRS})
add_definitions(${PCL_DEFINITIONS})

add_executable(mesh2pcd mesh2pcd.cpp)
target_link_libraries(mesh2pcd ${PCL_LIBRARIES})

add_executable(converter converter.cpp)
target_link_libraries(converter ${PCL_LIBRARIES})

add_executable(correspondence_grouping correspondence_grouping.cpp)
target_link_libraries(correspondence_grouping ${PCL_LIBRARIES})
