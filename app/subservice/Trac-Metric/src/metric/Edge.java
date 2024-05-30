package metric;

public class Edge {

	String developer1;
	String developer2;
	
	public Edge(String developer1, String developer2) {
		if (developer1.compareTo(developer2) < 0) {
			this.developer1 = developer1;
			this.developer2 = developer2;
		} else {
			this.developer1 = developer2;
			this.developer2 = developer1;
		}
	}
	
	public boolean equals(Edge edge) {
		return developer1.equals(edge.developer1) && developer2.equals(edge.developer2);
	}
}
