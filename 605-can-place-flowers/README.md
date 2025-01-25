# Leetcode Problem 605 - Can Place Flowers
## My Solution Stats
### Runtime: 166ms
### Beats: 6.43% of other submissions
### Memory: 14.16MB
### Beats: 100.00% of other submissions
## Description 
You have a long flowerbed in which some of the plots are planted, and some are not. However, flowers cannot be planted in adjacent plots.

Given an integer array flowerbed containing 0&#x27;s and 1&#x27;s, where 0 means empty and 1 means not empty, and an integer n, return true if n new flowers can be planted in the flowerbed without violating the no-adjacent-flowers rule and false otherwise.

 

Example 1:

Input: flowerbed = [1,0,0,0,1], n = 1
Output: true


Example 2:

Input: flowerbed = [1,0,0,0,1], n = 2
Output: false


 

Constraints:

 * 1 &lt;= flowerbed.length &lt;= 2 * 104
 * flowerbed[i] is 0 or 1.
 * There are no two adjacent flowers in flowerbed.
 * 0 &lt;= n &lt;= flowerbed.length