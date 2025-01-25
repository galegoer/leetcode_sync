# Leetcode Problem 2185 - Counting Words With a Given Prefix
## My Solution Stats
### Runtime: 0ms
### Beats: 100.00% of other submissions
### Memory: 17.75MB
### Beats: 88.75% of other submissions
## Description 
You are given an array of strings words and a string pref.

Return the number of strings in words that contain pref as a prefix.

A prefix of a string s is any leading contiguous substring of s.

 

Example 1:


Input: words = [&quot;pay&quot;,&quot;attention&quot;,&quot;practice&quot;,&quot;attend&quot;], pref = &quot;at&quot;
Output: 2
Explanation: The 2 strings that contain &quot;at&quot; as a prefix are: &quot;attention&quot; and &quot;attend&quot;.


Example 2:


Input: words = [&quot;leetcode&quot;,&quot;win&quot;,&quot;loops&quot;,&quot;success&quot;], pref = &quot;code&quot;
Output: 0
Explanation: There are no strings that contain &quot;code&quot; as a prefix.


 

Constraints:

 * 1 &lt;= words.length &lt;= 100
 * 1 &lt;= words[i].length, pref.length &lt;= 100
 * words[i] and pref consist of lowercase English letters.