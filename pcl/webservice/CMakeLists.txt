cmake_minimum_required(VERSION 2.8 FATAL_ERROR)

project(pcl_for_masters_thesis)

find_package(PCL 1.8 REQUIRED)
include_directories(${PCL_INCLUDE_DIRS})
link_directories(${PCL_LIBRARY_DIRS})
add_definitions(${PCL_DEFINITIONS})

# point cloud file converter
add_executable(converter converter.cpp)
target_link_libraries(converter ${PCL_LIBRARIES})

# correspondence grouping
add_executable(correspondence_grouping correspondence_grouping.cpp)
target_link_libraries(correspondence_grouping ${PCL_LIBRARIES})

# template alignment
add_executable(template_alignment template_alignment.cpp)
target_link_libraries(template_alignment ${PCL_LIBRARIES})
